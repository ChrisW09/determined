from typing import Dict, Optional, Tuple, cast


class ExperimentConfig(dict):
    def debug_enabled(self) -> bool:
        return bool(self.get("debug", False))

    def scheduling_unit(self) -> int:
        return int(self.get("scheduling_unit", 100))

    def native_enabled(self) -> bool:
        return "internal" in self and self["internal"] is not None and "native" in self["internal"]

    def native_parallel_enabled(self) -> bool:
        return bool(self["resources"]["native_parallel"])

    def averaging_training_metrics_enabled(self) -> bool:
        return bool(self["optimizations"]["average_training_metrics"])

    def slots_per_trial(self) -> int:
        return int(self["resources"]["slots_per_trial"])

    def experiment_seed(self) -> int:
        return int(self.get("reproducibility", {}).get("experiment_seed", 0))

    def profiling_enabled(self) -> bool:
        return bool(self.get("profiling", {}).get("enabled", False))

    def profiling_interval(self) -> Tuple[int, Optional[int]]:
        if not self.profiling_enabled():
            return 0, 0

        return self["profiling"]["begin_on_batch"], self["profiling"].get("end_after_batch", None)

    def profiling_sync_timings(self) -> bool:
        return bool(self.get("profiling", {}).get("sync_timings", True))

    def get_data_layer_type(self) -> str:
        return cast(str, self["data_layer"]["type"])

    def get_records_per_epoch(self) -> Optional[int]:
        records_per_epoch = self.get("records_per_epoch")
        return int(records_per_epoch) if records_per_epoch is not None else None

    def get_min_validation_period(self) -> Dict:
        min_validation_period = self.get("min_validation_period", {})
        assert isinstance(min_validation_period, dict)
        return min_validation_period

    def get_searcher_metric(self) -> str:
        searcher_metric = self.get("searcher", {}).get("metric")
        assert isinstance(
            searcher_metric, str
        ), f"searcher metric ({searcher_metric}) is not a string"

        return searcher_metric

    def get_min_checkpoint_period(self) -> Dict:
        min_checkpoint_period = self.get("min_checkpoint_period", {})
        assert isinstance(min_checkpoint_period, dict)
        return min_checkpoint_period
