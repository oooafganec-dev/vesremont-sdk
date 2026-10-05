require 'minitest/autorun'
require_relative 'lib/vesremont_api'

class ClientTest < Minitest::Test
  class FakeHttp
    attr_accessor :use_ssl, :verify_mode, :open_timeout, :read_timeout, :write_timeout, :max_retries
    attr_reader :calls
    def initialize(chunks = ['{"ok":true}'])
      @chunks, @calls = chunks, 0
    end
    def start
      yield self
    end
    def request(_req)
      @calls += 1
      response = Struct.new(:code, :chunks).new('200', @chunks)
      def response.to_hash = {}
      def response.read_body
        chunks.each { |chunk| yield chunk }
      end
      yield response
    end
  end

  def test_transport_security_and_limit
    fake = FakeHttp.new
    Net::HTTP.stub(:new, ->(host, port, proxy) {
      assert_equal 'vesremont.com', host
      assert_equal 443, port
      assert_nil proxy
      fake
    }) { assert_equal({ 'ok' => true }, Vesremont::Client.new.status) }
    assert fake.use_ssl
    assert_equal OpenSSL::SSL::VERIFY_PEER, fake.verify_mode
    assert_equal 0, fake.max_retries
    assert_equal 1, fake.calls
    fake = FakeHttp.new(['x' * (Vesremont::Client::MAX_REPLY + 1)])
    Net::HTTP.stub(:new, fake) do
      error = assert_raises(Vesremont::ApiError) { Vesremont::Client.new.status }
      assert_equal 'response_too_large', error.code
    end
  end

  def test_offline_contract
    api = Vesremont::Client.new(token: 'test-token')
    sent = []
    api.define_singleton_method(:perform) do |uri, req|
      sent << [uri, req]
      [200, {}, '{"ok":true}']
    end
    assert_equal({ 'ok' => true }, api.search('труборез', per_page: 10))
    uri, req = sent.last
    assert_equal 'vesremont.com', uri.host
    assert_equal 'https', uri.scheme
    assert_equal 'Bearer test-token', req['Authorization']
    %w[//evil.example /../oauth /products?x=1].each do |path|
      assert_raises(ArgumentError) { api.request('GET', path) }
    end
    assert_raises(ArgumentError) { api.request('POST', '/orders/submit', body: {}) }
    assert_equal 1, sent.size
    api.cart_draft(375094, 1)
    assert_equal '/api/v1/cart-drafts/', sent.last[0].path
    assert_equal '1', URI.decode_www_form(sent.last[0].query).to_h['quantity']
    api.define_singleton_method(:perform) do |_uri, _req|
      sent << nil
      [429, { 'retry-after' => '60' }, '{"code":"rate_limited","request_id":"abc","detail":"secret"}']
    end
    error = assert_raises(Vesremont::ApiError) { api.cart }
    assert_equal 429, error.status
    assert_equal '60', error.retry_after
    assert_equal 'abc', error.request_id
    refute_includes error.message, 'secret'
    assert_equal 3, sent.size
  end
end
