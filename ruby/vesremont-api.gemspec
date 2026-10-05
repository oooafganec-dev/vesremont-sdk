Gem::Specification.new do |spec|
  spec.name = 'vesremont-api'
  spec.version = '0.2.0'
  spec.summary = 'Bounded REST client for the Vesremont public API'
  spec.description = 'Vesremont catalog and buyer-authorized REST operations with verified TLS and no redirects.'
  spec.authors = ['Vesremont']
  spec.homepage = 'https://vesremont.com/developers/'
  spec.license = 'MIT'
  spec.required_ruby_version = '>= 3.3'
  spec.files = ['lib/vesremont_api.rb', 'README.md', 'LICENSE']
  spec.require_paths = ['lib']
  spec.metadata = {
    'homepage_uri' => 'https://vesremont.com/developers/',
    'documentation_uri' => 'https://vesremont.com/for_ai/api_ai/',
    'source_code_uri' => 'https://github.com/oooafganec-dev/vesremont-sdk/tree/main/ruby',
    'bug_tracker_uri' => 'https://github.com/oooafganec-dev/vesremont-sdk/issues'
  }
end
