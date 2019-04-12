npm run dev
npm run build
npm pack
npm unpublish --registry http://localhost:4873 --force
npm publish --registry http://localhost:4873

