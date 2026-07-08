require 'xcodeproj'

project_path = File.expand_path('../ios/RetroFighter.xcodeproj', __dir__)
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'RetroFighter' }
app_group = project.main_group['RetroFighter']

def ref_for(project, group, abs_path)
  name = File.basename(abs_path)
  existing = group.files.find { |f| f.display_name == name }
  existing || group.new_reference(abs_path)
end

def ensure_resource(target, ref)
  already = target.resources_build_phase.files.any? { |bf| bf.file_ref == ref }
  target.resources_build_phase.add_file_reference(ref) unless already
end

root = File.expand_path('..', __dir__)

# Firebase config -> bundle resource
gsi = ref_for(project, app_group, File.join(root, 'ios/RetroFighter/GoogleService-Info.plist'))
ensure_resource(target, gsi)

# Custom fonts -> bundle resources
%w[PressStart2P-Regular.ttf IBMPlexMono-Regular.ttf].each do |font|
  fref = ref_for(project, app_group, File.join(root, 'assets/fonts', font))
  ensure_resource(target, fref)
end

# Entitlements file reference (build setting already points at it)
ref_for(project, app_group, File.join(root, 'ios/RetroFighter/RetroFighter.entitlements'))

project.save
puts 'Linked resources:'
target.resources_build_phase.files.each { |bf| puts "  - #{bf.display_name}" }
