const { compile, emptyDir } = require('./utils')

require('./config')

async function build() {
  await emptyDir(_CONFIG_.path.dist)
  console.log('\nCompiling client...\n')
  await compile(require(_CONFIG_.path.webpack).client)
  console.log('\nCompiling server...\n')
  await compile(require(_CONFIG_.path.webpack).server)
}

build()
