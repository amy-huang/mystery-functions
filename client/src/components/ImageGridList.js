import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { Button } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 600,
  },
}));

/**
 * The example data is structured as follows:
 *
 * import image from 'path/to/image.jpg';
 * [etc...]
 *
 * const tileData = [
 *   {
 *     img: image,
 *     title: 'Image',
 *     author: 'author',
 *     cols: 2,
 *   },
 *   {
 *     [etc...]
 *   },
 * ];
 */
export default function ImageGridList() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <GridList cellHeight="auto" className={classes.gridList} cols={1}>
        {/* {tileData.map(tile => (
          <GridListTile key={tile.img} cols={tile.cols || 1}>
            <img src={tile.img} alt={tile.title} />
          </GridListTile>
        ))} */}
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
        <GridListTile cols={1}>
          <Button>hello</Button>
        </GridListTile>
      </GridList>
    </div>
  );
}