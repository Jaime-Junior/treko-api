pipeline {
  agent {
    docker {
      image "node:8-alpine"
      args "--network=skynet"
    }
  }
  stages {
    stage("Build") {
      steps {
        sh echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main'
        sh echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community'
        sh apk update
        sh apk add mongodb=3.4.4-r0
        sh "chmod +x ./scripts/dropdb.sh"
        sh "npm install"
      }
    }
    stage("Test") {
          steps {
         sh "npm run test:ci"
      }
    }         
  }
}
