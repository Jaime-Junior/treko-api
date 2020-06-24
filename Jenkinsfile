pipeline {
  agent {
    docker {
      image "node:12.18.1-alpine3.9"
      args "--network=skynet"
    }
  }
  stages {
    stage("Build") {
      steps {

        sh "apk add mongodb"
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
