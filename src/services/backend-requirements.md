# Backend Requirements for The Options Tab

This document outlines the required API endpoints, their parameters, and expected response formats to support the frontend functionality of The Options Tab.

## 1. Options Chain API

### GET /api/v1/options/assets
**Description**: Retrieves list of available assets for options trading.
**Response Format**:
```json
{
  "assets": ["BTC", "ETH", "SOL", "LINK", ...]
}
```

### GET /api/v1/options/{asset}
**Description**: Retrieves the full options chain for a specific asset.
**Parameters**:
- `asset`: Asset symbol (e.g., "BTC")
**Response Format**:
```json
{
  "asset": "BTC",
  "last_updated": "2025-04-13T06:53:50.133351Z",
  "underlying_price": 84705.57,
  "options_by_expiry": {
    "2025-04-13": {
      "call": [
        {
          "symbol": "C-BTC-75200-130425",
          "strike_price": 75200,
          "option_type": "call",
          "expiry_time": "2025-04-13T00:00:00Z",
          "underlying_asset": "BTC",
          "last_price": 0,
          "mark_price": 9505.59025707,
          "bid_price": 9313,
          "ask_price": 9712,
          "delta": 0.9999702,
          "gamma": 0.00000842,
          "theta": -1.35,
          "vega": 0.23
        },
        // ... more call options
      ],
      "put": [
        // ... put options with the same structure as calls
      ]
    },
    // ... more expiry dates
  }
}
```

## 2. Strategy API

### GET /api/v1/strategies/definitions
**Description**: Retrieves available predefined strategy definitions.
**Response Format**:
```json
[
  {
    "name": "Bull Call Spread",
    "type": "BULLISH",
    "description": "Buy a near-ATM call and sell a further OTM call with the same expiry. Limited profit, limited loss.",
    "legs": [
      {
        "leg_id": "buy_call",
        "side": "buy",
        "option_type": "call",
        "strike_method": "ATM",
        "strike_param": 0,
        "expiry_method": "NEAREST",
        "expiry_param": "",
        "ratio": 1
      },
      // ... other legs
    ]
  },
  // ... more strategy definitions
]
```

### POST /api/v1/strategies/construct
**Description**: Constructs a strategy based on a predefined definition.
**Request Body**:
```json
{
  "definition_name": "Long Straddle",
  "underlying_asset": "BTC",
  "base_quantity": 1
}
```
**Response Format**:
```json
{
  "definition_name": "Long Straddle",
  "underlying_asset": "BTC",
  "underlying_price_at_construction": 84748.9833333333,
  "legs": [
    {
      "definition": {
        // ... leg definition
      },
      "selected": {
        // ... selected option contract
      },
      "side": "buy",
      "ratio": 1
    },
    // ... other legs
  ],
  "base_quantity": 1,
  "estimated_cost": 1639.02851764,
  "timestamp": "2025-04-13T06:53:10.100621Z"
}
```

### POST /api/v1/strategies/custom
**Description**: Constructs a custom strategy from selected options.
**Request Body**:
```json
{
  "underlying_asset": "BTC",
  "legs": [
    {
      "option_symbol": "C-BTC-84800-140425",
      "side": "BUY",
      "quantity": 1
    },
    // ... more legs
  ]
}
```
**Response Format**: Same as `/strategies/construct`

### POST /api/v1/strategies/payoff
**Description**: Calculates the payoff profile of a strategy.
**Request Body**:
```json
{
  "strategy": {
    // ... strategy object from construct or custom
  },
  "price_min": 72036.6358333333,
  "price_max": 97461.33083333328,
  "num_points": 100
}
```
**Response Format**:
```json
{
  "strategy": {
    // ... original strategy object
  },
  "payoff": [
    {
      "underlying_price": 72036.6358333333,
      "profit_loss": 11124.335649026696
    },
    // ... more price points
  ],
  "max_profit": 11124.335649026696,
  "max_loss": -1561.6376338016496,
  "breakevens": [83160.97148236, 86439.02851764]
}
```

## 3. Enhanced Risk Analysis API

### POST /api/v1/strategies/risk-analysis
**Description**: Calculates advanced risk metrics for a strategy.
**Request Body**:
```json
{
  "strategy": {
    // ... strategy object
  }
}
```
**Expected Response Format**:
```json
{
  "risk_score": 65,
  "probability_of_profit": 60,
  "risk_reward_ratio": 1.5,
  "greek_exposures": {
    "delta_exposure": 0.45,
    "gamma_exposure": 0.0003,
    "theta_exposure": -15.5,
    "vega_exposure": 25.2
  },
  "scenario_analysis": [
    {
      "scenario": "bullish",
      "expected_return": 1250.50,
      "probability": 0.35
    },
    {
      "scenario": "neutral",
      "expected_return": -150.25,
      "probability": 0.40
    },
    {
      "scenario": "bearish",
      "expected_return": -650.75,
      "probability": 0.25
    }
  ],
  "volatility_impact": [
    {
      "iv_change": -20,
      "profit_impact": -350.25
    },
    {
      "iv_change": 0,
      "profit_impact": 0
    },
    {
      "iv_change": 20,
      "profit_impact": 420.75
    }
  ]
}
```

## 4. Historical Analysis API

### GET /api/v1/market/{asset}/historical
**Description**: Retrieves historical price and volatility data.
**Parameters**:
- `asset`: Asset symbol (e.g., "BTC")
- `start_date`: Start date for historical data (ISO format)
- `end_date`: End date for historical data (ISO format)
- `interval`: Data interval (e.g., "1d", "4h")

**Expected Response Format**:
```json
{
  "asset": "BTC",
  "interval": "1d",
  "data": [
    {
      "timestamp": "2025-03-13T00:00:00Z",
      "open": 73250.25,
      "high": 75320.50,
      "low": 72890.75,
      "close": 74580.30,
      "volume": 12500,
      "implied_volatility": 62.5
    },
    // ... more data points
  ]
}
```

## 5. Strategy Comparison API

### POST /api/v1/strategies/compare
**Description**: Compares multiple strategies across different market scenarios.
**Request Body**:
```json
{
  "strategies": [
    {
      // ... strategy object 1
    },
    {
      // ... strategy object 2
    }
  ],
  "scenarios": [
    {
      "name": "bullish",
      "price_change": 10,
      "iv_change": -5
    },
    {
      "name": "bearish",
      "price_change": -10,
      "iv_change": 15
    }
  ]
}
```
**Expected Response Format**:
```json
{
  "comparison": [
    {
      "strategy_name": "Long Straddle",
      "scenarios": [
        {
          "name": "bullish",
          "profit_loss": 1250.25,
          "roi": 15.5
        },
        {
          "name": "bearish",
          "profit_loss": 980.50,
          "roi": 12.2
        }
      ]
    },
    {
      "strategy_name": "Bull Call Spread",
      "scenarios": [
        {
          "name": "bullish",
          "profit_loss": 925.75,
          "roi": 24.8
        },
        {
          "name": "bearish",
          "profit_loss": -350.25,
          "roi": -9.4
        }
      ]
    }
  ],
  "optimal_strategy": {
    "bullish": "Bull Call Spread",
    "bearish": "Long Straddle"
  }
}
```

## Technical Requirements

1. **Response Times**:
   - API endpoints should respond within 200ms for simple requests
   - Complex calculations (payoff, risk analysis) should respond within 500ms

2. **Error Handling**:
   - All errors should return appropriate HTTP status codes
   - Error responses should include a descriptive message and error code
   - Example: `{"error": "Invalid strike price", "code": "INVALID_STRIKE", "status": 400}`

3. **Data Freshness**:
   - Options data should be updated at least every 1 minute
   - Historical data should be available with a maximum delay of 10 minutes

4. **Scalability**:
   - APIs should handle at least 100 requests per second
   - Support for at least 10,000 concurrent users

5. **Security**:
   - All endpoints should support proper authentication/authorization when implemented
   - Rate limiting should be implemented to prevent abuse
