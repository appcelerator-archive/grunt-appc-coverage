@NonCPS
def jsonParse(def json) {
	new groovy.json.JsonSlurperClassic().parseText(json)
}

timestamps {
	node('(osx || linux) && git && npm-publish') {
		def packageVersion = ''
		def isPR = false
		def publish = true
		def tagGit = true

		stage('Checkout') {
			checkout scm

			isPR = env.BRANCH_NAME.startsWith('PR-')
			tagGit = !isPR
			publish = !isPR

			def packageJSON = jsonParse(readFile('package.json'))
			packageVersion = packageJSON['version']
			currentBuild.displayName = "#${packageVersion}-${currentBuild.number}"

			changes = sh(returnStdout: true, script: "git log `git describe --tags --abbrev=0`..HEAD --oneline | sed 's/\$/\\\\/g'").trim()
		}

		nodejs(nodeJSInstallationName: 'node 6.9.5') {
			ansiColor('xterm') {

				stage('Dependencies') {
					sh 'npm install'
				} // stage

				stage('Build') {
					sh 'npm install nsp'
					sh 'node_modules/nsp/bin/nsp check --output summary --warn-only'
					sh 'npm uninstall nsp'
					sh 'npm prune'

					sh 'npm install retire'
					sh 'node_modules/retire/bin/retire --exitwith 0'
					// Scan for NSP and RetireJS warnings
					step([$class: 'WarningsPublisher', canComputeNew: false, canResolveRelativePaths: false, consoleParsers: [[parserName: 'Node Security Project Vulnerabilities'], [parserName: 'RetireJS']], defaultEncoding: '', excludePattern: '', healthy: '', includePattern: '', messagesPattern: '', unHealthy: ''])

					sh 'npm test'
				} // stage

				stage('Publish') {
					if (tagGit) {
						sh "git tag -a '${packageVersion}' -m 'Built by ${env.BUILD_USER}. See ${env.BUILD_URL} for more information.\n\nChanges:\n${changes}'"

						// HACK to provide credentials for git tag push
						// Replace once https://issues.jenkins-ci.org/browse/JENKINS-28335 is resolved
						withCredentials([usernamePassword(credentialsId: 'f63e8a0a-536e-4695-aaf1-7a0098147b59', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
							echo "Force pushing ${packageVersion} tag"
							sh "echo 'protocol=https\nhost=github.com\nusername=${USER}\npassword=${PASS}\n\n' | git credential approve "
							sh "git push origin ${packageVersion} --force"
						} // withCredentials
					} // tagGit

					// FIXME Log into npm and drop the need for npm-publish label!
					if (publish) {
						sh 'npm publish'
					}
				} // stage
			} // ansiColor
		} // nodejs
	} // node
} // timestamps
