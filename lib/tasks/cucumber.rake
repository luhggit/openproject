# IMPORTANT: This file is generated by cucumber-rails - edit at your own peril.
# It is recommended to regenerate this file in the future when you upgrade to a 
# newer version of cucumber-rails. Consider adding your own code to a new file 
# instead of editing this one. Cucumber will automatically load all features/**/*.rb
# files.


unless ARGV.any? {|a| a =~ /^gems/} # Don't load anything when running the gems:* tasks

begin
  require 'cucumber'
  require 'cucumber/rake/task'

  namespace :cucumber do
    Cucumber::Rake::Task.new({:ok => 'db:test:prepare'}, 'Run features that should pass') do |t|
      t.fork = true # You may get faster startup if you set this to false
    end

    task :statsetup do
      require 'rails/code_statistics'
      ::STATS_DIRECTORIES << %w(Cucumber\ features features) if File.exist?('features')
      ::CodeStatistics::TEST_TYPES << "Cucumber features" if File.exist?('features')
    end
  end
  desc 'Alias for cucumber:ok'
  task :cucumber => 'cucumber:ok'

  task :default => :cucumber

  # In case we don't have ActiveRecord, append a no-op task that we can depend upon.
  task 'db:test:prepare' do
  end

  task :stats => 'cucumber:statsetup'
rescue LoadError
  desc 'cucumber rake task not available (cucumber not installed)'
  task :cucumber do
    abort 'Cucumber rake task is not available. Be sure to install cucumber as a gem or plugin'
  end
end

end
