pipeline {
  agent {
    label "jenkins-nodejs"
  }
  environment {
    ORG = 'icf-jx-demo'
    APP_NAME = 'backend'
    CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
  }
  stages {
    stage('CI Build and push snapshot') {
      when {
        branch 'PR-*'
      }
      environment {
        PREVIEW_VERSION = "0.0.0-SNAPSHOT-$BRANCH_NAME-$BUILD_NUMBER"
        PREVIEW_NAMESPACE = "$APP_NAME-$BRANCH_NAME".toLowerCase()
        HELM_RELEASE = "$PREVIEW_NAMESPACE".toLowerCase()
        FRONTEND_VERSION = "0.0.4"
      }
      steps {
        container('nodejs') {
          sh "npm install"
          sh "CI=true DISPLAY=:99 npm test"
          sh "export VERSION=$PREVIEW_VERSION && skaffold build -f skaffold.yaml"
          sh "jx step post build --image $DOCKER_REGISTRY/$ORG/$APP_NAME:$PREVIEW_VERSION"
          
          dir('./charts/preview') {
            // jx get applications command fails :(
            // error: getting current user: user: Current not implemented on linux/amd64
            // seems that jx binary isn't correctly compiled for linux
            // sh """
            //    export FRONTEND_VERSION=\$("jx get applications -u -p --env=staging | grep frontend | awk '{print \\\$2}'")
            //    make preview
            //    """
            sh "make preview"
            sh "jx preview --app $APP_NAME --dir ../.."
          }
        }
        // this doesn't work :( error: Method calls on objects not allowed outside "script" blocks. @ line 39, column 9.
        // jx-icf-jx-demo-backend-pr-1.35.192.173.239.nip.io
        // pullRequest.comment("Frontend application available at: frontend.jx-icf-jx-demo-backend-${BRANCH_NAME}.35.192.173.239.nip.io")
      }
    }
    stage('Build Release') {
      when {
        branch 'master'
      }
      steps {
        container('nodejs') {

          // ensure we're not on a detached head
          sh "git checkout master"
          sh "git config --global credential.helper store"
          sh "jx step git credentials"

          // so we can retrieve the version in later steps
          sh "echo \$(jx-release-version) > VERSION"
          sh "jx step tag --version \$(cat VERSION)"
          sh "npm install"
          sh "CI=true DISPLAY=:99 npm test"
          sh "export VERSION=`cat VERSION` && skaffold build -f skaffold.yaml"
          sh "jx step post build --image $DOCKER_REGISTRY/$ORG/$APP_NAME:\$(cat VERSION)"
        }
      }
    }
    stage('Promote to Environments') {
      when {
        branch 'master'
      }
      steps {
        container('nodejs') {
          dir('./charts/backend') {
            sh "jx step changelog --batch-mode --version v\$(cat ../../VERSION)"

            // release the helm chart
            sh "jx step helm release"

            // promote through all 'Auto' promotion Environments
            sh "jx promote -b --all-auto --timeout 1h --version \$(cat ../../VERSION)"
          }
        }
      }
    }
  }
  post {
        always {
          cleanWs()
        }
  }
}
