TAG := $(shell git log --format=%h -1)
IMAGE ?= taccaci/hazmapper:$(TAG)

.PHONY: image
image:
	docker build -t $(IMAGE) -f angular/Dockerfile .

.PHONY: deploy
deploy:
	docker push $(IMAGE)
