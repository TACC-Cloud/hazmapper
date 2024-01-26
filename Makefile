TAG := $(shell git log --format=%h -1)

.PHONY: build-angular
build-angular:
	docker build -t taccaci/hazmapper:$(TAG) -f angular/Dockerfile .
	docker tag taccaci/hazmapper:$(TAG) taccaci/hazmapper:latest

.PHONY: build-react
build-react:
	docker build -t taccaci/hazmapper-react:$(TAG) -f react/Dockerfile .
	docker tag taccaci/hazmapper-react:$(TAG) taccaci/hazmapper-react:latest

.PHONY: build
build:
	make build-angular && make build-react

.PHONY: publish
publish:
	docker push taccaci/hazmapper:$(TAG)
	docker push taccaci/hazmapper-react:$(TAG)
