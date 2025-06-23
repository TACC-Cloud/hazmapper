DOCKER_IMAGE=taccaci/hazmapper-docs

.PHONY: build
build:
	docker build --rm -t $(DOCKER_IMAGE) .

.PHONY: run
run:
	docker run --rm -it -p 8000:8000 -v ${PWD}:/docs $(DOCKER_IMAGE)

.PHONY: publish
publish:
	docker push $(DOCKER_IMAGE)

