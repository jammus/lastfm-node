{
  description = "Clerk test project";

  # Nixpkgs / NixOS version to use.
  inputs.nixpkgs.url = "nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let

      # Generate a user-friendly version number.
      version = builtins.substring 0 8 self.lastModifiedDate;

      # System types to support.
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
      ];

      # Helper function to generate an attrset '{ x86_64-linux = f "x86_64-linux"; ... }'.
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;

      # Nixpkgs instantiated for supported system types.
      nixpkgsFor = forAllSystems (system: import nixpkgs { inherit system; });
    in
    {

      # Provide some binary packages for selected system types.
      packages = forAllSystems (system:
        let
          pkgs = nixpkgsFor.${system};
        in
        {
          # The default package for 'nix build'. This makes sense if the
          # flake provides only one package or there is a clear "main"
          # package.
          default = with pkgs;
            stdenv.mkDerivation {
              name = "clerk-test-project";
              src = self;
              nativeBuildInputs = [nodejs-18_x];
              dontInstall = true;
            };
        });
        devShells = forAllSystems (system: {
          default = nixpkgsFor.${system}.mkShell {
            name = "clerk-test-project";
            inputsFrom = [self.packages.${system}.default];
          };
        });
    };
}

