'use client';

export const IS_FREE_PLAN: boolean = process.env.NEXT_PUBLIC_ENV === 'staging' && window.origin === 'https://free.maffin.io';
export const IS_PAID_PLAN: boolean = process.env.NEXT_PUBLIC_ENV === 'master';
export const IS_DEMO_PLAN: boolean = !IS_FREE_PLAN && !IS_PAID_PLAN;

const PAID_PLAN_CONFIG = {
  auth0: {
    domain: 'maffin.eu.auth0.com',
    clientId: 'cEXnN96kEP3ER2EDJjmjRW0u2MEFBUKK',
    scopes: 'profile email https://www.googleapis.com/auth/drive.file',
  },
};

const FREE_PLAN_CONFIG = {
  auth0: {
    domain: 'maffin-dev.eu.auth0.com',
    clientId: 'mMmnR4NbQOnim9B8QZfe9wfFuaKb8rwW',
    scopes: 'profile email',
  },
};

const DEMO_PLAN_CONFIG = {
  auth0: {
    domain: 'maffin-dev.eu.auth0.com',
    clientId: 'mMmnR4NbQOnim9B8QZfe9wfFuaKb8rwW',
    scopes: 'profile email',
  },
};

function getConfig() {
  if (IS_PAID_PLAN) {
    return PAID_PLAN_CONFIG;
  }

  if (IS_FREE_PLAN) {
    return FREE_PLAN_CONFIG;
  }

  return DEMO_PLAN_CONFIG;
}

export const CONFIG = getConfig();
