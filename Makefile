build:
	docker build -t tgvoice .

run:
	docker run -d -p 3000:3000 --name tgvoice --rm tgvoice

stop:
	docker stop  tgvoice