
start:
	@npm start
server:
	@npm start

build:
	@npm run build

publish: build
	@./node_modules/.bin/gh-pages -d dist
