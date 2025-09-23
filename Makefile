TAG := $(shell git log --format=%h -1)

####
# `DOCKER_IMAGE_BRANCH_TAG` tag is the git tag for the commit if it exists, else the branch on which the commit exists
# Note: Special chars are replaced with dashes, e.g. feature/some-feature -> feature-some-feature
DOCKER_IMAGE_BRANCH_TAG := $(shell git describe --exact-match --tags 2> /dev/null || git symbolic-ref --short HEAD | sed 's/[^[:alnum:]\.\_\-]/-/g')

.PHONY: build-angular
build-angular:
	docker build -t taccaci/hazmapper:$(TAG) -f angular/Dockerfile .
	docker tag taccaci/hazmapper:$(TAG) taccaci/hazmapper:latest
	docker tag taccaci/hazmapper:$(TAG) taccaci/hazmapper:$(DOCKER_IMAGE_BRANCH_TAG)

.PHONY: build-react
build-react:
	docker build -t taccaci/hazmapper-react:$(TAG) -f react/Dockerfile .
	docker tag taccaci/hazmapper-react:$(TAG) taccaci/hazmapper-react:latest
	docker tag taccaci/hazmapper-react:$(TAG) taccaci/hazmapper-react:$(DOCKER_IMAGE_BRANCH_TAG)

.PHONY: build
build:
	make build-angular && make build-react

.PHONY: publish
publish:
	docker push taccaci/hazmapper:$(TAG)
	docker push taccaci/hazmapper-react:$(TAG)
	docker push taccaci/hazmapper:${DOCKER_IMAGE_BRANCH_TAG}
	docker push taccaci/hazmapper-react:${DOCKER_IMAGE_BRANCH_TAG}
