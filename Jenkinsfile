pipeline {
    agent any

    environment {
        NODE_VERSION        = '20'
        BACKEND_DIR         = 'backend'
        FRONTEND_DIR        = 'frontend'

        // Credentials stored in Jenkins credential store
        MONGO_URI           = credentials('ASKMYPDF_MONGO_URI')
        AWS_ACCESS_KEY_ID   = credentials('ASKMYPDF_AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('ASKMYPDF_AWS_SECRET_ACCESS_KEY')
        AWS_REGION          = credentials('ASKMYPDF_AWS_REGION')
        AWS_S3_BUCKET       = credentials('ASKMYPDF_AWS_S3_BUCKET')
        GOOGLE_GENAI_API_KEY = credentials('ASKMYPDF_GOOGLE_GENAI_API_KEY')
        GROQ_API_KEY        = credentials('ASKMYPDF_GROQ_API_KEY')
    }

    tools {
        nodejs "NodeJS-${NODE_VERSION}"
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {

        // ─────────────────────────────────────────────
        stage('Checkout') {
        // ─────────────────────────────────────────────
            steps {
                checkout scm
                echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT}"
            }
        }

        // ─────────────────────────────────────────────
        stage('Install Dependencies') {
        // ─────────────────────────────────────────────
            parallel {
                stage('Backend – Install') {
                    steps {
                        dir(BACKEND_DIR) {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend – Install') {
                    steps {
                        dir(FRONTEND_DIR) {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Lint') {
        // ─────────────────────────────────────────────
            parallel {
                stage('Backend – Lint') {
                    steps {
                        dir(BACKEND_DIR) {
                            sh 'npm run lint'
                            sh 'npm run format:check'
                        }
                    }
                }
                stage('Frontend – Lint') {
                    steps {
                        dir(FRONTEND_DIR) {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Build') {
        // ─────────────────────────────────────────────
            parallel {
                stage('Backend – Build') {
                    steps {
                        dir(BACKEND_DIR) {
                            sh 'npm run build'
                        }
                    }
                    post {
                        success {
                            archiveArtifacts artifacts: 'backend/dist/**', fingerprint: true
                        }
                    }
                }
                stage('Frontend – Build') {
                    steps {
                        dir(FRONTEND_DIR) {
                            sh 'npm run build'
                        }
                    }
                    post {
                        success {
                            archiveArtifacts artifacts: 'frontend/.next/**', fingerprint: true
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Deploy') {
        // ─────────────────────────────────────────────
            when {
                branch 'main'   // deploy only on the main branch
            }
            parallel {
                stage('Backend – Deploy') {
                    steps {
                        echo 'Deploying backend...'
                        // Replace the block below with your deployment commands,
                        // e.g. rsync to a server, push a Docker image, or trigger
                        // a cloud-run / ECS / EC2 deployment script.
                        sh '''
                            echo "Backend dist ready at backend/dist/"
                            # Example: rsync -avz backend/dist/ user@server:/app/backend/dist/
                            # Example: pm2 restart askmypdf-backend
                        '''
                    }
                }
                stage('Frontend – Deploy') {
                    steps {
                        echo 'Deploying frontend...'
                        // Replace with your Next.js deployment command.
                        sh '''
                            echo "Frontend build ready at frontend/.next/"
                            # Example: rsync -avz frontend/.next/ user@server:/app/frontend/.next/
                            # Example: pm2 restart askmypdf-frontend
                        '''
                    }
                }
            }
        }
    }

    // ─────────────────────────────────────────────
    post {
    // ─────────────────────────────────────────────
        always {
            echo "Pipeline finished with status: ${currentBuild.currentResult}"
            cleanWs()
        }
        success {
            echo '✅ Build succeeded!'
        }
        failure {
            echo '❌ Build failed! Check the logs above.'
            // Uncomment to send email notifications:
            // mail to: 'team@example.com',
            //      subject: "FAILED: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
            //      body: "See: ${env.BUILD_URL}"
        }
    }
}
