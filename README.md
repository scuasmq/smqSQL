# WELCOME TO SMQ's SPACE

## 环境说明
### on mac
nodjs 8.12.0
mysql Server version: 8.0.19 Homebrew
### on windows
nodjs 8.12.0
mysql Server version: **to be updated**
### [download url](https://nodejs.org/en/blog/release/v8.12.0/)

## 运行说明
可以F5直接debug，选择nodejs作为运行的后端
再次点击设置（小齿轮）可以生成配置文件，避免每次选择，但是需要注意文件路径
### .vscode 是工作区设置文件
- launch.json是运行文件，配置如下
  on mac:
  ```
  {
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/learnMaterial/demo/02_form.js"
        }
    ]
  }
  ```
    on windos:
    **to be updated**
  
### 本机访问url: 127.0.0.1:port port会显示在下方，一般是listen on 88
- 显示的是返回的json数据，因此没有html文件也可以显示
