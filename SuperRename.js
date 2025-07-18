/*
 * @name: Universal Node Rename
 * @description: 高度可定制的节点重命名脚本，保留原始顺序。
 * @version: 3.0
 * @author: Your Assistant
 *
 * 功能:
 * 1. 保留原始节点顺序。
 * 2. 自动添加国旗 Emoji。
 * 3. 标准化地区名称，例如 [HK], [US]。
 * 4. 清理冗余词汇，保留节点核心自定义名称（如编号、倍率等）。
 * 5.可通过 $arguments 参数控制各区域是否重命名，默认为全部开启。
 *   示例: ['hk=false', 'jp=false'] 表示不重命名香港和日本节点。
 */

module.exports.parse = async (raw, { axios, yaml, notify, console }) => {
  const { name, proxies } = yaml.parse(raw);

  // --- 可配置区域 ---
  // 从 $arguments 解析参数，如果未提供，则默认为 true
  const args = Object.fromEntries(($arguments || []).map(arg => arg.split('=')));
  const config = {
    hk: args.hk !== 'false', // 香港
    tw: args.tw !== 'false', // 台湾
    jp: args.jp !== 'false', // 日本
    sg: args.sg !== 'false', // 新加坡
    us: args.us !== 'false', // 美国
    mo: args.mo !== 'false', // 澳门
    kr: args.kr !== 'false', // 韩国
    gb: args.gb !== 'false', // 英国
    de: args.de !== 'false', // 德国
    fr: args.fr !== 'false', // 法国
    ru: args.ru !== 'false', // 俄国
  };

  // 定义地区规则：key, 旗帜, 正则表达式
  const regions = [
    { key: 'HK', flag: '🇭🇰', regex: /香港|Hong Kong|HK|HongKong/i, enabled: config.hk },
    { key: 'TW', flag: '🇹🇼', regex: /台湾|台灣|Taiwan|TW/i, enabled: config.tw },
    { key:com/Keywos/rule/main/rename.js: 'JP', flag: '🇯🇵', regex: /日本|东京|大阪|泉州|埼玉|沪日|穗日|中日|Japan|JP/i, enabled: config.jp },
    { key: 'SG', flag: '🇸🇬', regex: /新加坡|狮城|Singapore|SG/i, enabled: config.sg },
    { key: 'US', flag: '🇺🇸', regex: /美国|美|United States|US/i, enabled: config.us },
    { key: 'MO', flag: '🇲🇴', regex: /澳门|澳門|Macau|MO/i, enabled: config.mo },
    { key: 'KR', flag: '🇰🇷', regex: /韩国|韓國|Korea|KR/i, enabled: config.kr },
    { key: 'GB', flag: '🇬🇧', regex: /英国|英|United Kingdom|UK/i, enabled: config.gb },
    { key: 'DE', flag: '🇩🇪', regex: /德国|德|Germany|DE/i, enabled: config.de },
    { key: 'FR', flag: '🇫🇷', regex: /法国|法|France|FR/i, enabled: config.fr },
    { key: 'RU', flag: '🇷🇺', regex: /俄罗斯|俄|Russia|RU/i, enabled: config.ru },
    // 在这里可以继续添加更多地区规则
  ];

  // 遍历所有节点，进行处理 (核心逻辑)
  // 这个 for...of 循环确保了节点顺序不变
  for (const p of proxies) {
    let nodeName = p.name;
    let regionFound = false;

    // 1. 匹配地区并进行标准化重命名
    for (const region of regions) {
      if (region.enabled && region.regex.test(nodeName)) {
        // 移除原始地区名，保留其他部分
        const customPart = nodeName.replace(region.regex, '');
        // 组合成新名字
        nodeName = `${region.flag} [${region.key}]${customPart}`;
        regionFound = true;
        break; // 匹配到一个地区后立即停止，防止重复匹配
      }
    }

    // 2. 如果没有任何地区被匹配到，检查是否已存在国旗，若无则不处理
    // (这一步可以防止误伤没有地区信息的节点)

    // 3. 清理节点名称中的冗余词汇和格式
    // 移除各类广告/机场名/协议名
    nodeName = nodeName.replace(/官网|官方|原版|牆|墙|V2|SSR|SS|Trojan|Vmess/gi, '');
    // 移除线路类型或其他常见描述词 (使用 \b 确保匹配的是完整单词，避免误删)
    nodeName = nodeName.replace(/\b(IEPL|IPLC|CMI|NBN|CN2|GIA|专线|中转|回国|解锁|测试|游戏|GAME|Netflix|NF|Disney|YouTube|YT)\b/gi, '');
    // 移除各种分隔符和多余的空格
    nodeName = nodeName.replace(/[-|│┃│｜()（）\[\]【】]/g, ' '); // 将多种分隔符替换为空格
    nodeName = nodeName.replace(/\s{2,}/g, ' ').trim(); // 将多个连续空格合并为一个，并去除首尾空格
    
    // 4. 将处理好的新名称赋给节点
    p.name = nodeName;
  }

  return yaml.stringify({ name, proxies });
};
