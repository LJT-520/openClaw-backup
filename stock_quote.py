# -*- coding: utf-8 -*-
import akshare as ak
import pandas as pd

try:
    # 获取上证指数行情
    sh = ak.stock_zh_index_daily(symbol="sh000001")
    sh_today = sh.iloc[-1]
    sh_close = sh_today['close']
    sh_prev = sh.iloc[-2]['close']
    sh_chg = ((sh_close - sh_prev) / sh_prev) * 100
    print(f"上证指数: {sh_close:.2f}, 涨跌幅: {sh_chg:+.2f}%")
except Exception as e:
    print(f"上证指数获取失败: {e}")

try:
    # 获取深证成指行情
    sz = ak.stock_zh_index_daily(symbol="sz399001")
    sz_today = sz.iloc[-1]
    sz_close = sz_today['close']
    sz_prev = sz.iloc[-2]['close']
    sz_chg = ((sz_close - sz_prev) / sz_prev) * 100
    print(f"深证成指: {sz_close:.2f}, 涨跌幅: {sz_chg:+.2f}%")
except Exception as e:
    print(f"深证成指获取失败: {e}")

try:
    # 获取创业板指行情
    cy = ak.stock_zh_index_daily(symbol="sz399006")
    cy_today = cy.iloc[-1]
    cy_close = cy_today['close']
    cy_prev = cy.iloc[-2]['close']
    cy_chg = ((cy_close - cy_prev) / cy_prev) * 100
    print(f"创业板指: {cy_close:.2f}, 涨跌幅: {cy_chg:+.2f}%")
except Exception as e:
    print(f"创业板指获取失败: {e}")
