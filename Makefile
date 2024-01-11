.PHONY: build clean view serve deploy

build: node_modules
	yarn run build

serve: node_modules
	yarn start

clean:
	rm -rf build

view:
	open build/index.html

node_modules: package.json
	yarn


# Deployment.

RSYNCARGS := --compress --recursive --checksum --itemize-changes \
	--delete -e ssh --perms --chmod=Du=rwx,Dgo=rx,Fu=rw,Fog=r
DEST := cslinux:/courses/cs4110/2024sp

deploy: clean build
	rsync $(RSYNCARGS) build/ $(DEST)
