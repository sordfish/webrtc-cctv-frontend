## webrtc-cctv-frontend

Based off the ion-sfu example https://github.com/pion/ion-sfu/blob/master/examples/gallerytest/index.html

Includes helm chart for nginx

Helm chart assumes there is a tls cert in a secret

html is downloaded from git with an alpine init container vs building an nginx container