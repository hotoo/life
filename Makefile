
server:
	@markline server hotoo.md

build: clean
	@markline build hotoo.md

publish: build
	@ghp-import dist
	@git push origin gh-pages

clean:
	@rm -rf dist
