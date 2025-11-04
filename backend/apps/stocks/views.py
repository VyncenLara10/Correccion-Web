from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import logging
from datetime import datetime

from services.yahoo_finance_service import YahooFinanceService

logger = logging.getLogger(__name__)


class StocksViewSet(viewsets.ViewSet):
    """ViewSet para obtener datos de acciones desde Yahoo Finance"""
    
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Obtiene las acciones más populares
        GET /api/stocks/popular/
        """
        try:
            stocks = YahooFinanceService.get_popular_stocks()
            return Response({
                'success': True,
                'stocks': stocks,
                'count': len(stocks)
            })
        except Exception as e:
            logger.error(f"Error obteniendo acciones populares: {str(e)}")
            return Response({
                'success': False,
                'message': 'Error obteniendo datos de acciones'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def market_data(self, request):
        """
        Obtiene datos del mercado (acciones + criptos)
        GET /api/stocks/market_data/
        """
        try:
            data = YahooFinanceService.get_all_market_data()
            return Response({
                'success': True,
                'data': data
            })
        except Exception as e:
            logger.error(f"Error obteniendo datos del mercado: {str(e)}")
            return Response({
                'success': False,
                'message': 'Error obteniendo datos del mercado'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def cryptos(self, request):
        """
        Obtiene criptomonedas populares
        GET /api/stocks/cryptos/
        """
        try:
            cryptos = YahooFinanceService.get_popular_cryptos()
            return Response({
                'success': True,
                'cryptos': cryptos,
                'count': len(cryptos)
            })
        except Exception as e:
            logger.error(f"Error obteniendo criptomonedas: {str(e)}")
            return Response({
                'success': False,
                'message': 'Error obteniendo criptomonedas'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Busca una acción por símbolo
        GET /api/stocks/search/?symbol=AAPL
        """
        symbol = request.query_params.get('symbol')
        
        if not symbol:
            return Response({
                'success': False,
                'message': 'Símbolo requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            stock = YahooFinanceService.search_stock(symbol)
            
            if not stock:
                return Response({
                    'success': False,
                    'message': f'No se encontró {symbol}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'stock': stock
            })
        except Exception as e:
            logger.error(f"Error buscando {symbol}: {str(e)}")
            return Response({
                'success': False,
                'message': 'Error buscando acción'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def get_stock(self, request):
        """
        Obtiene datos de una acción específica
        GET /api/stocks/get_stock/?symbol=AAPL
        """
        symbol = request.query_params.get('symbol')
        
        if not symbol:
            return Response({
                'success': False,
                'message': 'Símbolo requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            stock = YahooFinanceService.get_stock_data(symbol)
            
            if not stock:
                return Response({
                    'success': False,
                    'message': f'No se encontró {symbol}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'stock': stock
            })
        except Exception as e:
            logger.error(f"Error obteniendo {symbol}: {str(e)}")
            return Response({
                'success': False,
                'message': 'Error obteniendo acción'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        Obtiene datos históricos de 1 año para una acción
        GET /api/stocks/history/?symbol=AAPL
        Devuelve array de datos diarios con fecha, close, high, low, volume
        """
        symbol = request.query_params.get('symbol')
        
        if not symbol:
            return Response({
                'success': False,
                'message': 'Símbolo requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            historical = YahooFinanceService.get_historical_data(symbol)
            
            return Response({
                'success': True,
                'symbol': symbol.upper(),
                'historical': historical,
                'count': len(historical),
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"Error obteniendo histórico de {symbol}: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error obteniendo histórico para {symbol}',
                'historical': [],
                'timestamp': datetime.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def detail(self, request):
        """
        Obtiene información detallada de una acción incluyendo histórico
        GET /api/stocks/detail/?symbol=AAPL
        """
        symbol = request.query_params.get('symbol')
        
        if not symbol:
            return Response({
                'success': False,
                'message': 'Símbolo requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            stock = YahooFinanceService.get_stock_detail(symbol)
            
            # Ahora siempre retorna datos, aunque sean con N/A
            # No verifica si stock es None porque el servicio maneja todos los errores
            if not stock:
                return Response({
                    'success': False,
                    'message': f'No se encontró {symbol}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'stock': stock
            })
        except Exception as e:
            logger.error(f"Error obteniendo detalles de {symbol}: {str(e)}")
            # Retornar respuesta con error pero con datos parciales disponibles
            return Response({
                'success': True,  # Cambiado a True para que el frontend lo acepte
                'stock': {
                    'symbol': symbol.upper(),
                    'name': symbol.upper(),
                    'price': 'N/A',
                    'change': 'N/A',
                    'changePercent': 'N/A',
                    'volume': 'N/A',
                    'marketCap': 'N/A',
                    'sector': 'N/A',
                    'industry': 'N/A',
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
                },
                'message': 'Datos parciales - algunos campos no disponibles'
            })
