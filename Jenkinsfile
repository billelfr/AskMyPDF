pipeline {
    agent any

    parameters {
        string(name: 'NAME', defaultValue: 'Amine', description: 'Name to greet')
        string(name: 'MESSAGE', defaultValue: 'Amine', description: 'Custom message to display')
    }

    stages {
        stage('Greet') {
            steps {
                echo "Hello World! ${params.NAME}"
                echo "Message: ${params.MESSAGE}"
            }
        }
    }
}