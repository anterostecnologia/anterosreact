npm run dev
npm run build
npm pack
npm unpublish --registry http://ec2-54-232-145-45.sa-east-1.compute.amazonaws.com:4873 --force
 npm publish --access public --registry http://ec2-54-232-145-45.sa-east-1.compute.amazonaws.com:4873

