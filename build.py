#!/usr/bin/env python3
"""
自动化构建脚本 - 用于执行npm构建命令

该脚本可以按顺序执行npm命令，处理输出，捕获错误，记录日志，并提供状态反馈。
"""

import subprocess
import os
import sys
import logging
import time
from typing import List, Dict, Optional

class NpmBuildAutomator:
    def __init__(self, 
                 commands: List[str] = None, 
                 working_dir: str = None, 
                 log_file: str = "build.log",
                 max_retries: int = 3,
                 retry_delay: int = 5):
        """
        初始化构建自动化器
        
        Args:
            commands: 要执行的npm命令列表，默认为['install', 'run build']
            working_dir: 工作目录，默认为当前目录
            log_file: 日志文件路径，默认为'build.log'
            max_retries: 最大重试次数，默认为3
            retry_delay: 重试延迟（秒），默认为5
        """
        self.commands = commands or ['install', 'run build']
        self.working_dir = working_dir or os.getcwd()
        self.log_file = log_file
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
        # 配置日志
        self._setup_logging()
        
    def _setup_logging(self):
        """配置日志系统"""
        # 确保日志目录存在
        log_dir = os.path.dirname(self.log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # 配置根日志器
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def run_npm_command(self, command: str, retry_count: int = 0) -> bool:
        """
        运行单个npm命令
        
        Args:
            command: 要执行的npm命令
            retry_count: 当前重试次数
            
        Returns:
            bool: 命令是否执行成功
        """
        full_command = f"npm {command}"
        self.logger.info(f"执行命令: {full_command}")
        
        try:
            # 执行命令
            process = subprocess.Popen(
                full_command, 
                shell=True, 
                cwd=self.working_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # 实时输出
            stdout, stderr = process.communicate()
            
            # 记录输出
            if stdout:
                self.logger.info(f"命令输出:\n{stdout}")
            if stderr:
                self.logger.error(f"命令错误:\n{stderr}")
            
            # 检查返回码
            returncode = process.returncode
            if returncode == 0:
                self.logger.info(f"命令 '{command}' 执行成功")
                return True
            else:
                self.logger.error(f"命令 '{command}' 执行失败，返回码: {returncode}")
                
                # 重试机制
                if retry_count < self.max_retries:
                    next_retry = retry_count + 1
                    self.logger.info(f"第 {next_retry} 次重试，等待 {self.retry_delay} 秒...")
                    time.sleep(self.retry_delay)
                    return self.run_npm_command(command, next_retry)
                else:
                    self.logger.error(f"命令 '{command}' 已达到最大重试次数 ({self.max_retries})，执行失败")
                    return False
                    
        except Exception as e:
            self.logger.error(f"执行命令时发生异常: {str(e)}")
            
            # 重试机制
            if retry_count < self.max_retries:
                next_retry = retry_count + 1
                self.logger.info(f"第 {next_retry} 次重试，等待 {self.retry_delay} 秒...")
                time.sleep(self.retry_delay)
                return self.run_npm_command(command, next_retry)
            else:
                self.logger.error(f"命令 '{command}' 已达到最大重试次数 ({self.max_retries})，执行失败")
                return False
    
    def run_build_process(self) -> bool:
        """
        运行完整的构建流程
        
        Returns:
            bool: 构建是否成功
        """
        self.logger.info("开始构建流程")
        self.logger.info(f"工作目录: {self.working_dir}")
        self.logger.info(f"执行命令序列: {self.commands}")
        
        # 检查npm是否可用
        if not self._check_npm_available():
            self.logger.error("npm 不可用，请确保已安装Node.js")
            return False
        
        # 执行命令序列
        for command in self.commands:
            if not self.run_npm_command(command):
                self.logger.error("构建流程失败")
                return False
        
        self.logger.info("构建流程成功完成")
        return True
    
    def _check_npm_available(self) -> bool:
        """
        检查npm是否可用
        
        Returns:
            bool: npm是否可用
        """
        try:
            process = subprocess.Popen(
                "npm --version",
                shell=True,
                cwd=self.working_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate()
            return process.returncode == 0
        except Exception:
            return False

def main():
    """主函数"""
    import argparse
    
    # 解析命令行参数
    parser = argparse.ArgumentParser(description="自动化npm构建脚本")
    parser.add_argument(
        "--commands", 
        nargs='+', 
        default=['install', 'run build'],
        help="要执行的npm命令列表"
    )
    parser.add_argument(
        "--working-dir", 
        default=os.getcwd(),
        help="工作目录"
    )
    parser.add_argument(
        "--log-file", 
        default="build.log",
        help="日志文件路径"
    )
    parser.add_argument(
        "--max-retries", 
        type=int, 
        default=3,
        help="最大重试次数"
    )
    parser.add_argument(
        "--retry-delay", 
        type=int, 
        default=5,
        help="重试延迟（秒）"
    )
    
    args = parser.parse_args()
    
    # 创建构建自动化器
    automator = NpmBuildAutomator(
        commands=args.commands,
        working_dir=args.working_dir,
        log_file=args.log_file,
        max_retries=args.max_retries,
        retry_delay=args.retry_delay
    )
    
    # 运行构建流程
    success = automator.run_build_process()
    
    # 退出代码
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()