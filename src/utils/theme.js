export const themeConfig = {
  token: {
    colorPrimary: '#1038CC',
    colorSuccess: '#61CE70',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorTextBase: '#2D2D2D',
    colorBgBase: '#FAFAFA',
    borderRadius: 10,
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14,
    colorBgContainer: '#FFFFFF',
  },
  components: {
    Button: { borderRadius: 10, controlHeight: 40 },
    Card: { borderRadius: 16 },
    Input: { borderRadius: 10, controlHeight: 40 },
    Select: { borderRadius: 10, controlHeight: 40 },
    Table: { headerBg: '#050126', headerColor: '#FFFFFF', borderRadius: 12 },
    Menu: { darkItemBg: '#000D31', darkSubMenuItemBg: '#050126', darkItemSelectedBg: '#1038CC' },
  }
};
