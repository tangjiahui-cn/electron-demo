const { spawn } = require("node:child_process");
const kill = require('tree-kill')

// 管理所有子进程
module.exports.CMD = (function () {
  let processList = [];

  // 杀死所有子进程
  function killAll() {
    processList.forEach((x) => kill(x.pid));
    processList = [];
  }

  // 执行命令
  // 例如: CMD.exec('ls -la'); // 执行单条命令
  // 或者：CMD.exec(['ls -la', 'pwd']) // 执行多条命令
  function exec(cmd) {
    if (Array.isArray(cmd)) {
      cmd.forEach(exec);
      return;
    }
    if (typeof cmd !== "string") return;
    cmd = cmd.split(" ");
    // win运行spawn报错问题 （https://juejin.cn/post/6844904022059515918）
    const child = spawn(cmd[0], cmd.slice(1), {
      shell: process.platform === 'win32'
    });
    child.addListener("exit", killAll);
    child.stdout.on("data", (data) => {
      // 打印标准输出流
      console.log(`${data}`);
    });
    processList.push(child);
  }

  return {
    exec,
  };
})();
