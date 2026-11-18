const catalog = [
['2026','南华大学','衡山Π战队 · 串联四足与主赛机器人',[
['四足机器人 RL 训练','https://github.com/uwvwko-zzz/uw-himloco','基于 HIMLoco 修改的强化学习框架。'],
['四足机器人 Sim2Real','https://github.com/uwvwko-zzz/himdog','串联四足机器人实机部署。'],
['R2 上位机','https://github.com/Mo-Fea/ctrl_logic'],
['R2 下位机','https://github.com/suibo789/R2_H'],
['R1 下位机','https://github.com/hhh-xie/2026Robocon-R1','G474 主控。驱动使用 FDCAN 接口，多数电机最高支持 1 Mbps，实际使用 Classical CAN。包含大疆 3508、达妙关节电机接口、ELRS 接收机 CRSF 解析和麦轮解算。']]],
['2026','西华大学','',[
['上位机完整代码','https://github.com/potato484/RC_2026'],
['R2 单片机工程','https://github.com/keil5-person/2026_Robot_2'],
['R1 完整代码','https://github.com/JoeZheng273/R1']]],
['2026','广西科技大学','LCR 战队 · 广科大',[
['R2 单片机工程','https://github.com/WangSteve123/2026_RoboCon_LCR_R2_V2','使用滑模控制器闭环控制大疆 3508 / 2006 电机速度，跨越台阶时使用动态线程。发布时附带部分电机驱动，完整驱动包待整理。'],
['R2 ROS 上位机工程','https://github.com/WangSteve123/LCR_2026_R2_Ros','开源说明附节点图与信息流。鸣谢重庆大学 auto_serial_bridge。']]],
['2026','湖南农业大学','湘农机器人 · 湖南农大',[
['R2 自主导航','https://github.com/junguo627/rc2_autonomous_nav','2026 武林探秘 R2 上位机完整代码。']]],
['2026','东北大学（秦皇岛）','',[
['R2 上位机','https://github.com/beansMilk/NEUQ-Robocon2026-Host-Computer','部分上位机代码，发布者提示可能仍有待修复的问题。']]],
['2026','福建理工大学','MTI 战队 · 福工',[
['R2 上位机代码解析','http://www.akatsuki-kaze.com.cn/2026/08/01/robocon2026R2/','原公告提到仓库将在发文当周公布。']]],
['2026','中北大学','2026 硬件开源企划与工程工具',[
['主控板第二版','https://oshwhub.com/ericyuhaotong/project_czxokunj'],
['IO-Link 主站拓展板及固件','https://oshwhub.com/ericyuhaotong/project_leseyekn'],
['通用舵轮舵向控制器','https://oshwhub.com/ericyuhaotong/project_lbifzbtm','基于电感式编码器。'],
['FOC 电调及固件','https://oshwhub.com/ericyuhaotong/project_rxoddcqz','基于 VESC，优化成本、面积和可制造性（DFM）。'],
['主控板第一版','https://oshwhub.com/ericyuhaotong/project_znthklvt'],
['电源管理模块','https://oshwhub.com/ericyuhaotong/project_fcnnonjm'],
['Robocon FSM 决策框架','https://github.com/Lumivers/robocon-fsm','从 2026 决策节点抽离赛题逻辑后整理出的通用框架，作者欢迎反馈与 Star。'],
['YOLO 外围算子加速','https://github.com/MTFTau-5/YOLO_operator_RC']]],
['2026','广州美术学院','广美',[
['2026 上位机代码','https://github.com/HGZQ1/GAFA-Artlnnov.RC2026']]],
['2026','山东华宇工学院','HYNova 战队 · 仿生足式障碍赛全国一等奖（第 7 名）',[
['RC_WheelLeg 轮足项目','https://github.com/zeitvex/RC_WheelLeg','十六自由度串联轮足开源项目。已收录中期 8DOF 机械、A 板下位机及部分文档，还有早期 16DOF 强化学习四轮足的机械和训练、仿真到实机全链路。V0.3.8 整理 ROS 2 最终部署，可通过 Tag 下载历史版本。具体 BOM 见交流群文件（QQ 群 767195310），其余机械、硬件、软件、装配等资料陆续整理。鸣谢 Robocon 青年顾问组、Lain 的 LocoWiki、备馆和比赛期间提供帮助的战队，以及提供独家赞助与技术支持的留形科技。']]],
['2026','福州大学','浮舟湿地战队 · 福大',[
['12DOF 点足 RL 训练代码','https://github.com/Taojunfeng123/quadruped_robot_lab','README 收录强化学习心得和框图。鸣谢队伍前辈与 Lain，欢迎反馈与 Star。'],
['12DOF 点足训练发布帖','https://bbs.robomaster.com/article/1938225'],
['R1 全向轮接、发球排球机器人设计报告','https://bbs.robomaster.com/article/1950737?source=4'],
['R2 排球机器人机械结构','https://bbs.robomaster.com/article/1942698?source=4']]],
['2026','深圳职业技术大学','深圳职业技术大学 1 队',[
['R2 完整代码','https://github.com/inkccc/Rc2026','下位机提供升降、机械臂和底盘的电机接口。感知、决策与动作逻辑均在上位机。']]],
['2026','重庆大学','重大',[
['auto_serial_bridge','https://github.com/ConQU2026/auto_serial_bridge','使用 YAML 定义 ROS 2 与 MCU 协议，编译时生成两端代码。ROS 端自动转换话题与串口帧，MCU 端提供 protocol.h、protocol.c 和 PROTOCOL_DOC.md。支持协议哈希握手、心跳、断线重连及可选 ACK 超时重传。']]],
['2026','广白','',[
['硬件开源','https://oshwhub.com/i-havent-thought-about-it-for-th/project_otiaiqxg']]],
['2027','南华大学','衡山Π战队 · 场地仿真',[
['狗赛地图','https://github.com/uwvwko-zzz/27rc-dog-race'],
['主赛道地图','https://github.com/jimi4-lei/gazebo_models']]],
['2027','深圳职业技术大学','Techx 战队',[
['ROBOCON 2027 场地仿真','https://github.com/walunt5/r2027_gazebo_model_copy','基于南华大学衡山Π战队的 gazebo_models 修改，优化了碰撞模型。包含 Gazebo Classic 场地、天空块和地基块摆放工具，以及可在场地中运行的麦克纳姆底盘机器人。']]],
['docs','西华大学','',[
['AidLux 论坛开源帖','https://forum.aidlux.com/t/topic/74685']]],
['docs','中北大学','epoch 战队 · 上位机感知学习路线',[
['RC 上位机：从入门到入土（基础篇）','https://lumivers.feishu.cn/wiki/EGrxwhP7Ki1RoykkMmxcINbfnSc?from=from_parent_docx','面向零基础同学。'],
['RC 上位机：从入门到入土（进阶篇）','https://lumivers.feishu.cn/wiki/I0S2wsP9DiUsGdkp1kkc9s48ngb?from=from_parent_docx','面向已有基础的同学，配合下方决策框架学习。'],
['配套 Robocon FSM 框架','https://github.com/Lumivers/robocon-fsm']]],
['docs','广州美术学院','广美',[
['算法基础篇教学','https://github.com/HGZQ1/Alg_Team_Tutorial']]],
['docs','福建理工大学','福工 · xfjj',[
['算法入门','https://www.akatsuki-kaze.com.cn/2026/08/05/doc-for-fresh-man/']]],
['docs','厦门大学','厦大 · 强烈建议观看',[
['序章：欢迎来到 RCS 新生思训课！','https://wolumonde.feishu.cn/wiki/Uk7vwi1pxiR7HWkdN43cCkoYnab?_wv=1&from=from_parent_docx'],]]
];
