TAG := $(shell git log --format=%h -1)

.PHONY: build-angular
build-angular:
	docker build -t taccwma/hazmapper:$(TAG) -f angular/Dockerfile .
	docker tag taccwma/hazmapper:$(TAG) taccwma/hazmapper:latest

.PHONY: build-react
build-react:
	docker build -t taccwma/hazmapper-react:$(TAG) -f react/Dockerfile .
	docker tag taccwma/hazmapper-react:$(TAG) taccwma/hazmapper-react:latest

.PHONY: build
build:
	make build-angular && make build-react

.PHONY: publish
publish:
	docker push taccwma/hazmapper:$(TAG)
	docker push taccwma/hazmapper-react:$(TAG)
