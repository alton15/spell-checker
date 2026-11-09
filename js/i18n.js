const STRINGS = {
  ko: {
    start: '게임 시작',
    end: '게임 종료',
    roles: { top: '탑', jungle: '정글', mid: '미드', adc: '원딜', support: '서폿' },
    cosmic: '우통',
    boots: { none: '신발 없음', lucidity: '쿨감신', crimson: '핏빛' },
    bootsHint: '탭해서 신발 변경',
    cd: '쿨',
    eta: '활성',
    untracked: '추적 안 함',
    timerHint: '눌러서 인게임 시간 입력',
    timeInvalid: '예: 12:34 또는 1234',
    changeSpell: '스펠 변경',
    pickerTitle: (role, slot) => `${role} 스펠 ${slot} 변경`,
    close: '닫기',
    soundOn: '알림음 켜짐',
    soundOff: '알림음 꺼짐',
    ready: (role, spell) => `${role} ${spell} 활성`
  },
  en: {
    start: 'Start',
    end: 'End',
    roles: { top: 'Top', jungle: 'Jungle', mid: 'Mid', adc: 'ADC', support: 'Support' },
    cosmic: 'Insight',
    boots: { none: 'No boots', lucidity: 'Lucidity', crimson: 'Crimson' },
    bootsHint: 'Tap to change boots',
    cd: 'CD',
    eta: 'ETA',
    untracked: 'Not tracked',
    timerHint: 'Tap to enter the in-game time',
    timeInvalid: 'e.g. 12:34 or 1234',
    changeSpell: 'Change spell',
    pickerTitle: (role, slot) => `${role} spell ${slot}`,
    close: 'Close',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    ready: (role, spell) => `${role} ${spell} is up`
  }
};

export const getLang = (doc) => (doc.documentElement.lang === 'en' ? 'en' : 'ko');
export const getStrings = (lang) => STRINGS[lang];
