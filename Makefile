
start:
	@npm start
server:
	@npm start

build:
	@npm run build

publish: build
	@ghp-import dist
	@git push origin gh-pages
