pipeline {
    agent {
        docker {
            image 'nithinsuram/cypress-cucumber-typescript'
            args '--entrypoint=""'
        }
    }
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Cypress Tests') {
            steps {
                sh 'npx cypress run --config-file cypress.config.ts'
            }
        }
    }
    post {
        always {
            node {
                archiveArtifacts artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*', allowEmptyArchive: true
            }
        }
    }
}