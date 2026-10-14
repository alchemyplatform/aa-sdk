{
  description = "AA-SDK Flake";

  inputs = { nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable"; };

  outputs = { self, nixpkgs }:
    let
      system = "aarch64-darwin";
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [ nodejs yarn ];

        shellHook = ''
          echo "Node.js development environment activated!"
          echo "Node version: $(node --version)"
          echo "Yarn version: $(yarn --version)"
        '';
      };
    };
}
