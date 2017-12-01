FROM ubuntu:16.04

LABEL maintainer="Thomas Insel <tinsel@tinsel.org>"

RUN \
  apt-get update && \
  apt-get install -y libwww-perl

COPY sync* /

ENTRYPOINT ["./sync_wrapper.pl"]

CMD ["-l", "http://user:pass@172.17.1.101", "-r", "http://s3-us-west-2.amazonaws.com/my_example_bucket/outlets.txt"]
