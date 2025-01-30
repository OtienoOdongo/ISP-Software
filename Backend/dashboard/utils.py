def get_rate_color(rate):
    """
    Determine the color representation for a rate.
    :param rate: float, the rate value to check
    :return: str, color name ('green', 'red', or 'gray')
    """
    if rate > 0:
        return 'green'
    elif rate < 0:
        return 'red'
    else:
        return 'gray'