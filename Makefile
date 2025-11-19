TAG := $(shell git log --format=%h -1)

####
# `DOCKER_IMAGE_BRANCH_TAG` tag is the git tag for the commit if it exists, else the branch on which the commit exists
# Note: Special chars are replaced with dashes, e.g. feature/some-feature -> feature-some-feature
DOCKER_IMAGE_BRANCH_TAG := $(shell git describe --exact-match --tags 2> /dev/null || git symbolic-ref --short HEAD | sed 's/[^[:alnum:]\.\_\-]/-/g')

.PHONY: build-angular
build-angular:
	docker build -t taccwma/hazmapper:$(TAG) -f angular/Dockerfile .
	docker tag taccwma/hazmapper:$(TAG) taccwma/hazmapper:latest
	docker tag taccwma/hazmapper:$(TAG) taccwma/hazmapper:$(DOCKER_IMAGE_BRANCH_TAG)

.PHONY: build-react
build-react:
	docker build -t taccwma/hazmapper-react:$(TAG) -f react/Dockerfile .
	docker tag taccwma/hazmapper-react:$(TAG) taccwma/hazmapper-react:latest
	docker tag taccwma/hazmapper-react:$(TAG) taccwma/hazmapper-react:$(DOCKER_IMAGE_BRANCH_TAG)

.PHONY: build
build:
	make build-angular && make build-react

.PHONY: publish
publish:
	docker push taccwma/hazmapper:$(TAG)
	docker push taccwma/hazmapper-react:$(TAG)
	docker push taccwma/hazmapper:${DOCKER_IMAGE_BRANCH_TAG}
	docker push taccwma/hazmapper-react:${DOCKER_IMAGE_BRANCH_TAG}
