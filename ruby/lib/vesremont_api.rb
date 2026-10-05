# frozen_string_literal: true
require 'net/http'
require 'json'
require 'openssl'
require 'timeout'

module Vesremont
  class ApiError < StandardError
    attr_reader :status, :code, :request_id, :retry_after
    def initialize(status, code, request_id = nil, retry_after = nil)
      @status, @code, @request_id, @retry_after = status, code, request_id, retry_after
      super("Vesremont: #{code} (HTTP #{status})")
    end
  end

  class Client
    ORIGIN = 'https://vesremont.com/api/v1'
    MAX_REPLY = 2 * 1024 * 1024

    def initialize(token: '', timeout: 15)
      raise ArgumentError, 'Invalid access token' unless token.is_a?(String) && (token.empty? || token.match?(/\A[A-Za-z0-9_.~-]{1,8192}\z/))
      raise ArgumentError, 'Timeout must be 0..60 seconds' unless timeout.is_a?(Numeric) && timeout.positive? && timeout <= 60
      @token, @timeout = token.dup.freeze, timeout
    end

    def request(method, path, query: {}, body: nil, idempotency_key: nil)
      raise ArgumentError, 'Invalid API method/path' unless %w[GET POST PATCH DELETE].include?(method) && path.is_a?(String) && path.match?(/\A\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\/?\z/)
      raise ArgumentError, 'JSON object required; GET body not supported' if !body.nil? && (method == 'GET' || !body.is_a?(Hash))
      raise ArgumentError, 'Idempotency-Key is required' if method == 'POST' && path.delete_suffix('/') == '/orders/submit' && idempotency_key.nil?
      if !idempotency_key.nil? && !(idempotency_key.is_a?(String) && idempotency_key.match?(/\A[A-Za-z0-9._:-]{16,128}\z/))
        raise ArgumentError, 'Invalid idempotency key'
      end
      raise ArgumentError, 'Query must be a Hash' unless query.is_a?(Hash)
      params = query.map do |name, value|
        raise ArgumentError, 'Query values must be scalar' unless name.to_s.match?(/\A[a-z_]{1,40}\z/) && [String, Integer, Float, TrueClass, FalseClass].any? { |type| value.is_a?(type) }
        [name.to_s, value.to_s]
      end
      encoded = URI.encode_www_form(params)
      raise ArgumentError, 'Query exceeds 8192 characters' if encoded.bytesize > 8192
      uri = URI(ORIGIN + path + (encoded.empty? ? '' : '?' + encoded))
      payload = body.nil? ? nil : JSON.generate(body)
      raise ArgumentError, 'Request body exceeds 64 KiB' if payload && payload.bytesize > 65536
      req = Net::HTTPGenericRequest.new(method, !payload.nil?, true, uri.request_uri)
      req['Accept'], req['User-Agent'] = 'application/json', 'Vesremont-Ruby/0.2.0'
      req['Authorization'] = 'Bearer ' + @token unless @token.empty?
      req['Idempotency-Key'] = idempotency_key unless idempotency_key.nil?
      if payload
        req['Content-Type'] = 'application/json'
        req.body = payload
      end
      status, headers, raw = perform(uri, req)
      begin
        data = raw.empty? ? nil : JSON.parse(raw)
      rescue JSON::ParserError
        raise ApiError.new(status, 'invalid_json')
      end
      unless status.between?(200, 299)
        problem = data.is_a?(Hash) ? data : {}
        raise ApiError.new(status, safe(problem['code']) || 'http_error', safe(problem['request_id']), safe(headers['retry-after']))
      end
      data
    end

    def status = request('GET', '/status')
    def cart = request('GET', '/cart')
    def search(q, **query) = request('GET', '/products', query: query.merge(q: q))
    def product(id) = request('GET', "/products/#{product_id(id)}")
    def cart_draft(id, quantity = 1, draft: nil)
      raise ArgumentError, 'Quantity must be 1..99' unless quantity.is_a?(Integer) && quantity.between?(1, 99)
      query = { product_id: product_id(id), quantity: quantity }
      query[:draft] = draft unless draft.nil?
      request('GET', '/cart-drafts/', query: query)
    end

    private

    def product_id(value)
      raise ArgumentError, 'Positive product ID required' unless value.is_a?(Integer) && value.between?(1, 2_147_483_647)
      value
    end
    def safe(value) = value.is_a?(String) && value.match?(/\A[A-Za-z0-9_.:-]{1,128}\z/) ? value : nil

    def perform(uri, req)
      http = Net::HTTP.new(uri.host, uri.port, nil)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER
      http.open_timeout = http.read_timeout = http.write_timeout = @timeout
      http.max_retries = 0
      raw = +''
      status = 0
      headers = {}
      Timeout.timeout(@timeout) do
        http.start do |session|
          session.request(req) do |response|
            status, headers = response.code.to_i, response.to_hash.transform_values(&:first)
            response.read_body do |chunk|
              raise ApiError.new(status, 'response_too_large') if raw.bytesize + chunk.bytesize > MAX_REPLY
              raw << chunk
            end
          end
        end
      end
      [status, headers, raw]
    rescue Timeout::Error, IOError, SystemCallError, SocketError, OpenSSL::SSL::SSLError, EOFError, Net::HTTPBadResponse, Net::ProtocolError
      raise ApiError.new(0, 'transport_error')
    end
  end
end
