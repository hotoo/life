
watch:
	@markline server --watch hotoo.md

publish: clean
	@markline build hotoo.md
	@ghp-import dist
	@git push origin gh-pages

clean:
	@rm -rf dist
