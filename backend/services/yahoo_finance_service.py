import yfinance as yf
import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

logger = logging.getLogger(__name__)


class YahooFinanceService:
    """Servicio para obtener datos de Yahoo Finance"""
    
    # Lista de símbolos populares
    POPULAR_STOCKS = [
        'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA',
        'NVDA', 'META', 'JPM', 'V', 'WMT',
        'DIS', 'NFLX', 'BA', 'KO', 'PFE',
        'JNJ', 'UNH', 'MA', 'HD', 'MCD',
        'ADBE', 'CRM', 'ORCL', 'IBM', 'INTC',
        'AMD', 'GE', 'CAT', 'MMM', 'PG'
    ]
    
    POPULAR_CRYPTOS = [
        'BTC-USD', 'ETH-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD'
    ]
    
    @staticmethod
    def get_stock_data(symbol):
        """Obtiene datos de una acción específica"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Obtener información actual
            info = ticker.info
            current_price = info.get('currentPrice', 0)
            previous_close = info.get('previousClose', current_price)
            
            if current_price == 0:
                return None
            
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            return {
                'symbol': symbol,
                'name': info.get('longName', symbol),
                'price': round(current_price, 2),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
                'volume': info.get('volume', 0),
                'marketCap': info.get('marketCap', 0),
                'currency': info.get('currency', 'USD'),
                'lastUpdate': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error obteniendo datos de {symbol}: {str(e)}")
            return None
    
    @staticmethod
    def get_multiple_stocks(symbols):
        """Obtiene datos de múltiples acciones en paralelo"""
        stocks = []
        
        # Usar ThreadPoolExecutor para hacer peticiones en paralelo
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Enviar todas las peticiones
            future_to_symbol = {
                executor.submit(YahooFinanceService.get_stock_data, symbol): symbol 
                for symbol in symbols
            }
            
            # Recopilar resultados conforme se completan
            for future in as_completed(future_to_symbol):
                try:
                    data = future.result()
                    if data:
                        stocks.append(data)
                except Exception as e:
                    symbol = future_to_symbol[future]
                    logger.error(f"Error procesando {symbol}: {str(e)}")
                    continue
        
        return stocks
    
    @staticmethod
    def get_popular_stocks():
        """Obtiene datos de las acciones más populares"""
        return YahooFinanceService.get_multiple_stocks(YahooFinanceService.POPULAR_STOCKS)
    
    @staticmethod
    def get_popular_cryptos():
        """Obtiene datos de las criptomonedas más populares"""
        return YahooFinanceService.get_multiple_stocks(YahooFinanceService.POPULAR_CRYPTOS)
    
    @staticmethod
    def get_all_market_data():
        """Obtiene acciones y criptomonedas"""
        stocks = YahooFinanceService.get_popular_stocks()
        cryptos = YahooFinanceService.get_popular_cryptos()
        
        return {
            'stocks': stocks,
            'cryptos': cryptos,
            'total': len(stocks) + len(cryptos)
        }
    
    @staticmethod
    def search_stock(query):
        """Busca acciones por símbolo o nombre"""
        try:
            ticker = yf.Ticker(query.upper())
            info = ticker.info
            
            if not info:
                return None
            
            current_price = info.get('currentPrice', 0)
            previous_close = info.get('previousClose', current_price)
            
            if current_price == 0:
                return None
            
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            return {
                'symbol': query.upper(),
                'name': info.get('longName', query.upper()),
                'price': round(current_price, 2),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
                'volume': info.get('volume', 0),
                'marketCap': info.get('marketCap', 0),
                'currency': info.get('currency', 'USD'),
                'lastUpdate': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error buscando {query}: {str(e)}")
            return None
    
    @staticmethod
    def get_historical_data(symbol):
        """Obtiene datos históricos de 1 año para una acción"""
        try:
            ticker = yf.Ticker(symbol.upper())
            
            # Obtener histórico de 1 año
            hist = ticker.history(period='1y')
            
            if hist.empty:
                logger.warning(f"No hay datos históricos para {symbol}")
                return []
            
            historical_data = []
            for date, row in hist.iterrows():
                try:
                    historical_data.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'close': round(float(row['Close']), 2),
                        'open': round(float(row['Open']), 2),
                        'high': round(float(row['High']), 2),
                        'low': round(float(row['Low']), 2),
                        'volume': int(row['Volume'])
                    })
                except Exception as e:
                    logger.warning(f"Error procesando fila histórica para {symbol}: {str(e)}")
                    continue
            
            logger.info(f"Histórico obtenido para {symbol}: {len(historical_data)} días")
            return historical_data
        except Exception as e:
            logger.error(f"Error obteniendo histórico para {symbol}: {str(e)}")
            return []
    
    @staticmethod
    def get_stock_detail(symbol):
        """Obtiene información detallada de una acción incluyendo histórico"""
        try:
            ticker = yf.Ticker(symbol.upper())
            info = ticker.info
            
            # Función auxiliar para convertir a número seguro
            def safe_number(val, decimals=2, default='N/A'):
                try:
                    if val is None:
                        return default
                    num = float(val)
                    return round(num, decimals)
                except (TypeError, ValueError):
                    return default
            
            # Obtener precio actual
            current_price = safe_number(info.get('currentPrice') or info.get('regularMarketPrice'))
            
            # Si no hay precio, intentar obtenerlo del histórico
            if current_price == 'N/A':
                try:
                    hist = ticker.history(period='1d')
                    if not hist.empty:
                        price_val = float(hist['Close'].iloc[-1])
                        current_price = round(price_val, 2)
                except:
                    pass
            
            # Obtener datos históricos para gráficas
            historical_data = []
            try:
                hist = ticker.history(period='1y')
                if not hist.empty:
                    for date, row in hist.iterrows():
                        try:
                            historical_data.append({
                                'date': date.strftime('%Y-%m-%d'),
                                'close': round(float(row['Close']), 2),
                                'high': round(float(row['High']), 2),
                                'low': round(float(row['Low']), 2),
                                'volume': int(row['Volume'])
                            })
                        except:
                            continue
            except Exception as e:
                logger.warning(f"No se pudo obtener histórico para {symbol}: {str(e)}")
            
            # Calcular cambio
            previous_close = safe_number(info.get('previousClose') or info.get('regularMarketPreviousClose'))
            
            if isinstance(current_price, (int, float)) and isinstance(previous_close, (int, float)):
                change = round(current_price - previous_close, 2)
                change_percent = round((change / previous_close * 100) if previous_close > 0 else 0, 2)
            else:
                change = 'N/A'
                change_percent = 'N/A'
            
            # Obtener dividendo yield de forma segura
            dividend_yield = info.get('dividendYield')
            if dividend_yield and isinstance(dividend_yield, (int, float)):
                dividend_yield = round(dividend_yield * 100, 2)
            else:
                dividend_yield = 'N/A'
            
            return {
                'symbol': symbol.upper(),
                'name': info.get('longName') or info.get('shortName') or symbol.upper(),
                'sector': info.get('sector') or 'N/A',
                'industry': info.get('industry') or 'N/A',
                'price': current_price,
                'change': change,
                'changePercent': change_percent,
                'volume': info.get('volume') or 'N/A',
                'avgVolume': info.get('averageVolume') or 'N/A',
                'marketCap': info.get('marketCap') or 'N/A',
                'beta': safe_number(info.get('beta')),
                'pe': safe_number(info.get('trailingPE')),
                'dividend': safe_number(info.get('dividendRate')),
                'dividendYield': dividend_yield,
                '52WeekHigh': safe_number(info.get('fiftyTwoWeekHigh')),
                '52WeekLow': safe_number(info.get('fiftyTwoWeekLow')),
                'description': info.get('longBusinessSummary') or 'No disponible',
                'currency': info.get('currency') or 'USD',
                'historicalData': historical_data[-365:] if historical_data else [],
                'lastUpdate': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error obteniendo detalles de {symbol}: {str(e)}")
            # Retornar datos parciales
            return {
                'symbol': symbol.upper(),
                'name': symbol.upper(),
                'sector': 'N/A',
                'industry': 'N/A',
                'price': 'N/A',
                'change': 'N/A',
                'changePercent': 'N/A',
                'volume': 'N/A',
                'avgVolume': 'N/A',
                'marketCap': 'N/A',
                'beta': 'N/A',
                'pe': 'N/A',
                'dividend': 'N/A',
                'dividendYield': 'N/A',
                '52WeekHigh': 'N/A',
                '52WeekLow': 'N/A',
                'description': f'No se pudo cargar información para {symbol}',
                'currency': 'USD',
                'historicalData': [],
                'lastUpdate': datetime.now().isoformat()
            }
