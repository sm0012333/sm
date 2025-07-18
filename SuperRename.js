/*
 * @name: Universal Node Rename
 * @description: 高度可定制的节点重命名脚本，保留原始顺序。
 * @version: 3.1 - Corrected
 * @author: Your Assistant
 *
 * 功能:
 * 1. 保留原始节点顺序。
 * 2. 自动添加国旗 Emoji。
 * 3. 标准化地区名称，例如 [HK], [US]。
 * 4. 清理冗余词汇，保留节点核心自定义名称（如编号、倍率等）。
 * 5. 可通过 $arguments 参数控制各区域是否重命名，默认为全部开启。
 */

module.exports.parse = async (raw, { axios, yaml, notify, console }) => {
  const { name, proxies } = yaml.parse(raw);

  // --- 可配置区域 ---
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
    { key: 'JP', flag: '🇯🇵', regex: /日本|东京|大阪|泉州|埼玉|沪日|穗日|中日|Japan|JP/i, enabled: config.jp }, // <-- 这里是修正后的地方
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

  for (const p of proxies) {
    let nodeName = p.name;
    let regionFound = false;

    for (const region of regions) {
      if (region.enabled && region.regex.test(nodeName)) {
        const customPart = nodeName.replace(region.regex, '');
        nodeName = `${region.flag} [${region.key}]${customPart}`;
        regionFound = true;
        break; 
      }
    }

    // 清理节点名称中的冗余词汇和格式
    nodeName = nodeName.replace(/官网|官方|原版|牆|墙|V2|SSR|SS|Trojan|Vmess/gi, '');
    nodeName = nodeName.replace(/\b(IEPL|IPLC|CMI|NBN|CN2|GIA|专线|中转|回国|解锁|测试|游戏|GAME|Netflix|NF|Disney|YouTube|YT)\b/gi, '');
    nodeName = nodeName.replace(/[-|│┃│｜()（）\[\]【】]/g, ' '); 
    nodeName = nodeName.replace(/\s{2,}/g, ' ').trim(); 
    
    p.name = nodeName;
  }

  return yaml.stringify({ name, proxies });
};
