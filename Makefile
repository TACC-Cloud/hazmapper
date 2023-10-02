TAG := $(shell git log --format=%h -1)
IMAGE ?= taccaci/hazmapper:$(TAG)

.PHONY: build
build:
	docker build -t $(IMAGE) -f angular/Dockerfile .
	docker tag taccaci/hazmapper:${TAG} taccaci/hazmapper:latest

.PHONY: deploy
deploy:
	docker push $(IMAGE)
