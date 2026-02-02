// BAML Generator Configuration
// This file configures how BAML generates code from the schema

generator typescript {
  // Generate TypeScript client code
  language typescript
  // Output directory for generated code
  output_dir "../src/generated/baml"
  // Package name for imports
  package_name "@baml/client"
}
