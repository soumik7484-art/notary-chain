const UAParser = require('ua-parser-js');

exports.extractDeviceInfo = (req, res, next) => {
  try {
    const p = new UAParser(req.headers['user-agent']);
    const r = p.getResult();
    let location = null;
    if (req.headers['x-location']) {
      try {
        location = typeof req.headers['x-location'] === 'string' ? JSON.parse(req.headers['x-location']) : req.headers['x-location'];
      } catch (e) {
        location = null;
      }
    }
    req.deviceInfo = {
      ipAddress: req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
      browser: r.browser?.name || 'Unknown Browser',
      browserVersion: r.browser?.version || '1.0',
      os: r.os?.name || 'Unknown OS',
      osVersion: r.os?.version || '1.0',
      device: r.device?.model || 'Desktop',
      deviceType: r.device?.type || 'desktop',
      screenResolution: req.headers['x-screen-resolution'] || '1920x1080',
      location,
      userAgent: req.headers['user-agent'] || 'Browser'
    };
  } catch (err) {
    req.deviceInfo = {
      ipAddress: req.ip || '127.0.0.1',
      deviceType: 'desktop'
    };
  }
  next();
};
