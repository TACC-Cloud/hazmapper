TAG := $(shell git log --format=%h -1)
IMAGE ?= taccaci/hazmapper:$(TAG)

.PHONY: image
image:
	docker build -t $(IMAGE) .

.PHONY: deploy
	docker push $(IMAGE)
