import datetime

MONDAY = 0
FRIDAY = 4


def gencal(start, end):
    date = start
    while date <= end:
        print('- date: {}'.format(date.strftime('%B %-d')))
        if date.weekday() == MONDAY:
            print('  mon: true')

        # Follow MWF pattern.
        if date.weekday() == FRIDAY:
            date += datetime.timedelta(days=3)
        else:
            date += datetime.timedelta(days=2)


if __name__ == '__main__':
    gencal(
        datetime.date(2024, 1, 22),
        datetime.date(2024, 5, 7),
    )
