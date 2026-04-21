package com.sive.validation.prediction.system.util;

import com.sive.validation.prediction.system.dto.markets.rates.MarketRateDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RateMapper {

    private RateMapper() {
    }

    public static List<Map<String, Object>> toRateMapList(
            List<MarketRateDTO> rates) {
        return rates.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("instrument", r.getInstrument());
            map.put("date", r.getDate() != null
                    ? r.getDate().toString().replace("T", " ")
                    : "");
            map.put("rate", r.getRate());
            map.put("lag1", r.getLag1() != null ? r.getLag1() : 0.0);
            map.put("lag7", r.getLag7() != null ? r.getLag7() : 0.0);
            map.put("rollingMean7", r.getRollingMean7() != null ? r.getRollingMean7() : 0.0);
            map.put("rollingStd7", r.getRollingStd7() != null ? r.getRollingStd7() : 0.0);
            map.put("rateScaled", r.getRateScaled() != null ? r.getRateScaled() : 0.0);
            return map;
        }).toList();
    }
}