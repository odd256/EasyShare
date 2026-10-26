import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSiteConfig } from '../config/site-validation.ts';

const config = {
  title: 'EasyShare', description: '数字花园', author: '作者', language: 'zh-CN',
  copyrightStartYear: 2026, url: 'http://localhost:3000', notesOrder: 'desc',
  createdFieldName: 'created', updatedFieldName: 'updated', displayDateField: 'updated',
  links: { github: '', twitter: '', email: '' },
  analytics: { umami: { websiteId: '', scriptUrl: 'https://cloud.umami.is/script.js' } },
};

test('默认本地配置及关闭的可选功能有效', () => {
  assert.doesNotThrow(() => validateSiteConfig(config));
});

test('错误的站点配置给出明确诊断', () => {
  for (const change of [{title: ''}, {url: 'example.com'}, {url: 'javascript:alert(1)'}, {url: 'https://example.com/?x=1'}, {notesOrder: 'random'}, {displayDateField: 'other'}, {copyrightStartYear: 0}, {language: ''}, {links: {...config.links, email: 'bad-email'}}]) {
    assert.throws(() => validateSiteConfig({...config, ...change}), /EasyShare 配置错误/);
  }
});

test('部署时拒绝默认地址与不匹配的子路径', () => {
  const previousDeploy = process.env.EASYSHARE_DEPLOY;
  const previousPath = process.env.PAGES_BASE_PATH;
  try {
    process.env.EASYSHARE_DEPLOY = 'true';
    process.env.PAGES_BASE_PATH = '/example-blog';
    assert.throws(() => validateSiteConfig(config), /公开站点地址/);
    assert.throws(() => validateSiteConfig({...config, url: 'https://user.github.io'}), /不一致/);
    assert.doesNotThrow(() => validateSiteConfig({...config, url: 'https://user.github.io/example-blog/'}));
    process.env.PAGES_BASE_PATH = '';
    assert.doesNotThrow(() => validateSiteConfig({...config, url: 'https://blog.example.com'}));
    assert.doesNotThrow(() => validateSiteConfig({...config, url: 'https://user.github.io'}));
  } finally {
    if (previousDeploy === undefined) delete process.env.EASYSHARE_DEPLOY;
    else process.env.EASYSHARE_DEPLOY = previousDeploy;
    if (previousPath === undefined) delete process.env.PAGES_BASE_PATH;
    else process.env.PAGES_BASE_PATH = previousPath;
  }
});
