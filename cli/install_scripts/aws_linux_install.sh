# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash NVM_DIR="/fleet/nvm"

# Install NVM to ./temp and add to the .nvm_profile env file.

PROFILE="./.nvm_profile" NVM_DIR="./temp" bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash'

# Re-source the env, so that we have access to the `nvm` command.

source .nvm_profile

# Install Node 19

nvm install 19

# Update NPM

npm install -g npm