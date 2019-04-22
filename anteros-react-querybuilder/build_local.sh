npm run dev
npm run build
npm pack
npm unpublish --registry http://vps4657.publiccloud.com.br:4873 --force
npm publish --registry http://vps4657.publiccloud.com.br:4873

